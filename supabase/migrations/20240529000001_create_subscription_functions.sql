-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to update user subscription in a transaction
CREATE OR REPLACE FUNCTION update_user_subscription(
  p_email TEXT,
  p_customer_id TEXT,
  p_subscription_id TEXT,
  p_tier TEXT,
  p_status TEXT,
  p_end_date TIMESTAMPTZ,
  p_price_id TEXT,
  p_event_type TEXT,
  p_user_id UUID,
  p_amount INTEGER,
  p_currency TEXT
) RETURNS VOID AS $$
BEGIN
  -- Update the user's profile
  UPDATE profiles
  SET 
    stripe_customer_id = p_customer_id,
    stripe_subscription_id = p_subscription_id,
    user_tier = p_tier,
    subscription_status = p_status,
    subscription_end_date = p_end_date,
    updated_at = NOW()
  WHERE email = p_email;

  -- Log to subscription history
  INSERT INTO subscription_history (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    event_type,
    subscription_tier,
    status,
    amount,
    currency,
    created_at
  ) VALUES (
    p_user_id,
    p_customer_id,
    p_subscription_id,
    p_event_type,
    p_tier,
    p_status,
    p_amount,
    p_currency,
    NOW()
  );

END;
$$ LANGUAGE plpgsql;

-- Create a function to check and update expired subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions() RETURNS VOID AS $$
DECLARE
  expired_record RECORD;
BEGIN
  -- Find all profiles with active/cancelled subscriptions that have expired
  FOR expired_record IN 
    SELECT 
      id, 
      email, 
      stripe_customer_id, 
      stripe_subscription_id
    FROM 
      profiles
    WHERE 
      subscription_status IN ('active', 'cancelled') 
      AND subscription_end_date IS NOT NULL 
      AND subscription_end_date < NOW()
  LOOP
    -- Update to free tier
    UPDATE profiles
    SET 
      user_tier = 'free',
      subscription_status = 'inactive',
      subscription_end_date = NULL,
      updated_at = NOW()
    WHERE 
      id = expired_record.id;
      
    -- Log expiration event
    INSERT INTO subscription_history (
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      event_type,
      subscription_tier,
      status,
      amount,
      currency,
      created_at
    ) VALUES (
      expired_record.id,
      expired_record.stripe_customer_id,
      expired_record.stripe_subscription_id,
      'subscription_expired_auto',
      'free',
      'inactive',
      0,
      'usd',
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to check for expired subscriptions every hour
SELECT cron.schedule(
  'check-expired-subscriptions',
  '0 * * * *',  -- Run every hour at minute 0
  $$SELECT check_expired_subscriptions()$$
);

-- Script to verify all existing vendors
UPDATE vendors
SET verified_status = 'verified'
WHERE verified_status != 'verified';

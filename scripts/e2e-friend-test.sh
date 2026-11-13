#!/usr/bin/env bash
# End-to-end friend-system test with two fresh users.
# Both users use @lovedove-e2e.local so cleanup-test-data.sql removes them all.
SB="https://pytjmswiynjsjatluftd.supabase.co"
KEY="sb_publishable_wP5d2t-Nl8D1eSt4-iguyQ_BTGx-1Ph"
TS=$(date +%s)
sign() { curl -s -X POST "$SB/auth/v1/signup" -H "apikey: $KEY" -H "Content-Type: application/json" -d "$1"; }

echo "── step 1: create users A and B (trigger should auto-create profiles) ──"
SA=$(sign "{\"email\":\"lovedove.e2e.a.$TS@lovedove-e2e.local\",\"password\":\"TestPass12345\",\"data\":{\"full_name\":\"E2E Anna\",\"username\":\"e2e_a_$TS\"}}")
A=$(echo "$SA" | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4)
ATOK=$(echo "$SA" | grep -oE '"access_token":"[^"]+"' | head -1 | cut -d'"' -f4)
SBb=$(sign "{\"email\":\"lovedove.e2e.b.$TS@lovedove-e2e.local\",\"password\":\"TestPass12345\",\"data\":{\"full_name\":\"E2E Ben\",\"username\":\"e2e_b_$TS\"}}")
B=$(echo "$SBb" | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4)
BTOK=$(echo "$SBb" | grep -oE '"access_token":"[^"]+"' | head -1 | cut -d'"' -f4)
echo "A=$A B=$B"

sleep 2
echo "── step 2: both profile rows exist? (anonymous read) ──"
# NOTE: trigger derives username from the email local part, so the rows are
# named lovedove_e2e_{a,b}_<ts> — query loosely by prefix.
curl -s -G "$SB/rest/v1/profiles" --data-urlencode "select=username" --data-urlencode "or=(username.like.%e2e_a_$TS%,username.like.%e2e_b_$TS%)" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"

echo; echo "── step 3: A searches B's username (the app's exact query) ──"
curl -s -G "$SB/rest/v1/profiles" --data-urlencode "select=id,full_name,username" --data-urlencode "or=(username.ilike.%e2e_b_$TS%,full_name.ilike.%Ben%)" -H "apikey: $KEY" -H "Authorization: Bearer $ATOK" | head -c 300

echo; echo "── step 4: A sends a friend request to B ──"
curl -s -X POST "$SB/rest/v1/friend_requests" -H "apikey: $KEY" -H "Authorization: Bearer $ATOK" -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d "{\"sender_id\":\"$A\",\"receiver_id\":\"$B\",\"status\":\"pending\"}" | head -c 300

echo; echo "── step 5: notification auto-created for B? ──"
curl -s "$SB/rest/v1/notifications?select=type,title,created_at&user_id=eq.$B&order=created_at.desc&limit=3" -H "apikey: $KEY" -H "Authorization: Bearer $BTOK" | head -c 300

echo; echo "── step 6: B reads incoming request (Requests tab) ──"
REQID=$(curl -s "$SB/rest/v1/friend_requests?select=id,status&receiver_id=eq.$B&order=created_at.desc&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $BTOK" | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4)
echo "request id: $REQID"
curl -s "$SB/rest/v1/friend_requests?select=id,sender_id,receiver_id,status&receiver_id=eq.$B&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $BTOK" | head -c 300

echo; echo "── step 7: B accepts ──"
curl -s -X PATCH -w " [%{http_code}]" "$SB/rest/v1/friend_requests?id=eq.$REQID" -H "apikey: $KEY" -H "Authorization: Bearer $BTOK" -H "Content-Type: application/json" -d '{"status":"accepted","accepted_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' | head -c 250

echo; echo "── step 8: A sees the accepted friendship ──"
curl -s "$SB/rest/v1/friend_requests?select=id,status,sender_id,receiver_id&sender_id=eq.$A&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $ATOK" | head -c 250
echo
echo "E2E DONE"

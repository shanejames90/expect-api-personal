#!/bin/bash

API="http://localhost:4741"
URL_PATH="/purchases"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "purchase": {
      "location": "'"${LOCATION}"'",
      "date": "'"${DATE}"'",
      "price": "'"${PRICE}"'",
      "comment": "'"${COMMENT}"'"
    }
  }'

echo

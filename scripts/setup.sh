#! /usr/bin/env sh

openapi-generator-cli generate \
  -g typescript-fetch \
  -i ./iwf-idl/iwf-sdk.yaml \
  -o ./gen/iwfidl \
  --additional-properties=npmName=iwfidl
  
npm install ./gen/iwfidl/ --install-links

npx typed-openapi \
  iwf-idl/iwf-sdk.yaml \
  -o gen/api-schema.ts \
  --runtime zod

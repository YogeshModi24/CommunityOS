# API Overview

The CommunityOS API is a RESTful service that uses JSON for requests and responses.

## Base URL
In local development, the API is available at:
`http://localhost:5000/api/v1`

## Authentication
Most endpoints require a JWT token passed in the `Authorization` header:
`Authorization: Bearer <token>`

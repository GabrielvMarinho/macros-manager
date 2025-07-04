# Patterns

## Exception handling
Exception handling is mandatory in the highest function of the process

If method A -> method B -> method C
you can have try catches in the lower levels (B and C), but there should always be the main on at the "method A" as a top layer of everything.
Internal methods shall not have error handling.

## Type of return
The callable functions should always return a json (uses json.dumps for that).
When only a confirmation feedback is needed it will be sent with a key "status", having value either "sucess" or "error"
When the function needs to effectively return a data structure there is no issue in just sending an object containing the data

## Method / Attribute naming
snake_case + appending "__" at the start if its an internal method
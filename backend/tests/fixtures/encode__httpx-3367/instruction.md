# Issue

**Title:** Ensure JSON representation is compact. #3363

## Description

# Summary

this PR solves the issues mentionned here #3363

> The following related issues could all be resolved together...
> 
> We should use ensure_ascii=False for more compact text representations.
> We should use separators = (',', ':') for more compact list and object representations.
> We should use allow_nan=False to disallow invalid Infinity and NaN representations.

## Task

Modify the repository so that the issue described above is resolved. The task's test suite verifies your patch by applying it on top of the base commit `8e36f2bc685d` and running the modified tests.
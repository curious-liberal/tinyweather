# Tiny Weather
An AI powered weather app with a gorgeous UI that tells you the weather in various tones.

# A note about public API keys
This app used to use Deep Infra to run client side as they didn't require an authorization header to process API requests. Unfortunately this is no longer the case. As a result I have decided to use Open Router as they provide some free models. In an effort to keep the code client-side I have exposed the API key on the client. However this API key is from a burner account that's not linked to any cards or payment details as it is using a free model.

I haven't linked the API key in the Git repo but it's quite easy to detect client-side. I am aware of this and it's not a security issue I have a problem with.

Feel free to fork the repo and create a version where API requests are handled server-side, however I will not be doing this.

Enjoy!

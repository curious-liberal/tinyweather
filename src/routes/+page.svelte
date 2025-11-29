<script lang="ts">
    import Searchbar from "$lib/comps/SearchBar.svelte"

    const placeholderSuggestions = ["London", "Glasgow", "Birmingham", "Norwich", "Malta"]
</script>

<div class="wrapper">
    <div class="header">
        <h1 class="title">TinyWeather</h1>
        <p class="subtitle">AI-powered weather with personality</p>
    </div>
    <Searchbar {placeholderSuggestions} searchIcon="left" />
</div>

<style>
    .wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 2em;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .header {
        text-align: center;
        margin-bottom: 3em;
    }

    .title {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 3.5em;
        font-weight: 300;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .subtitle {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 1.2em;
        margin: 0.5em 0 0 0;
        opacity: 0.9;
        font-weight: 300;
    }

    @media (max-width: 768px) {
        .wrapper {
            padding: 1em;
        }

        .title {
            font-size: 2.5em;
        }

        .subtitle {
            font-size: 1em;
        }
    }
</style>
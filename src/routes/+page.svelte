<script lang="ts">
    import { onMount } from 'svelte';
    import Searchbar from "$lib/comps/SearchBar.svelte"
    import { getPopularSearches } from "$lib/stores/searchHistory";

    let placeholderSuggestions = $state(["London", "Glasgow", "Birmingham", "Norwich", "Malta"]);

    const updatePlaceholderSuggestions = () => {
        placeholderSuggestions = getPopularSearches(5);
    };

    onMount(() => {
        // Update placeholder suggestions with popular searches
        updatePlaceholderSuggestions();
    });

    let currentGradient = $state('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    let isTransitioning = $state(false);

    const handleGradientChange = (gradient: {background: string, accent: string}) => {
        isTransitioning = true;

        // Smooth transition after a short delay
        setTimeout(() => {
            currentGradient = gradient.background;
            isTransitioning = false;
        }, 300);
    };
</script>

<div
    class="wrapper"
    class:transitioning={isTransitioning}
    style="--current-gradient: {currentGradient}"
>
    <div class="header">
        <h1 class="title">TinyWeather</h1>
        <p class="subtitle">AI-powered weather with personality</p>
    </div>
    <Searchbar
        {placeholderSuggestions}
        searchIcon="left"
        onGradientChange={handleGradientChange}
        onSearchLogged={updatePlaceholderSuggestions}
    />
</div>

<style>
    .wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 2em;
        background: var(--current-gradient);
        color: white;
        transition: background 2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .wrapper::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.01) 100%);
        pointer-events: none;
        animation: subtleGlow 12s ease-in-out infinite alternate;
    }

    .wrapper.transitioning {
        transition: background 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .header {
        text-align: center;
        margin-bottom: 3em;
        z-index: 2;
        position: relative;
        animation: fadeInDown 1s ease-out;
    }

    .title {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 4em;
        font-weight: 100;
        margin: 0;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        letter-spacing: -2px;
        background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .subtitle {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 1.1em;
        margin: 1em 0 0 0;
        opacity: 0.85;
        font-weight: 400;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    @keyframes subtleGlow {
        0% {
            opacity: 0.4;
        }
        100% {
            opacity: 0.8;
        }
    }

    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        .wrapper {
            padding: 1em;
        }

        .title {
            font-size: 2.8em;
            letter-spacing: -1px;
        }

        .subtitle {
            font-size: 1em;
            letter-spacing: 0.3px;
        }

        .header {
            margin-bottom: 2em;
        }
    }

    @media (max-width: 480px) {
        .title {
            font-size: 2.2em;
        }

        .wrapper {
            padding: 0.8em;
        }
    }
</style>
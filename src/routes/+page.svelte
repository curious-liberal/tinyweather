<script lang="ts">
    import Searchbar from "$lib/comps/SearchBar.svelte"

    const placeholderSuggestions = ["London", "Glasgow", "Birmingham", "Norwich", "Malta"]
</script>

<div class="wrapper">
    <Searchbar {placeholderSuggestions} searchIcon="left" />
</div>
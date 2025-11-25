<script lang="ts">
    import Searchbar from "$lib/comps/SearchBar.svelte"

    const suggestions = ["London", "Glasgow", "Birmingham", "Norwich", "Malta"]
</script>

<div class="wrapper">
    <Searchbar {suggestions} searchIcon="left" />
</div>
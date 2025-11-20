<script lang="ts">
    import { TypeWriter } from "$lib/libs/typewriter"
	import { onMount } from "svelte"

    const props = $props<{suggestions: string[]}>()
    const suggestions = props.suggestions

    let placeholder = $state("")

    const updatePlaceholder = (text: string): void => {
        placeholder = text
    }

    onMount( () => {
        const tw = new TypeWriter({
            content: suggestions,
            target: updatePlaceholder,
        })

        tw.write()
    })
</script>

<input class="searchbar" type="text" {placeholder}>
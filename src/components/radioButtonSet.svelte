<!-- radioButtonSet.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let options: { id: string; label: string; value: string }[];
    export let selectedValue: string;
    export let name: string;
    export let hidden:boolean = false;

    const dispatch = createEventDispatcher();

    const handleSelectionChange = (event: Event) => {
        const inputElement = event.target as HTMLInputElement | null; // event.target could be null

        if (inputElement) { // Check if inputElement is not null
            selectedValue = inputElement.value;
            dispatch('change', selectedValue);
        }
    };
</script>

        <div class="btn-group col-md-12" role="group" aria-label="Basic radio toggle button group" style="padding:10px 0px 0px 0px;" hidden={hidden}>
            {#each options as option (option.id)}
                <input
                    type="radio"
                    class="btn-check"
                    name={name}
                    id={option.id}
                    value={option.value}
                    autocomplete="off"
                    bind:group={selectedValue}
                    on:change={handleSelectionChange}
                />
                <label class="btn btn-outline-primary" for={option.id}>{option.label}</label>
            {/each}
        </div>

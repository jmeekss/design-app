<script lang="ts">
    export let label: string; // Label for the switch
    export let checked: boolean = false; // Whether the switch is on/off
    export let disabled: boolean = false; // Whether the switch is disabled
    export let id: string; // Unique ID for the switch
</script>

<div class="form-check form-switch">
    <input
        class="form-check-input"
        type="checkbox"
        id={id}
        bind:checked={checked}
        {disabled}
    />
    <label class="form-check-label" for={id}>{label}</label>
</div>

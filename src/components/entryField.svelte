<script lang="ts">
    export let value: number | null = null; // Initialize as null
    export let unit: string;
    export let required: boolean = false;
    export let disabled: boolean = false;
    export let hidden: boolean = false;
    export let id: string;
    export let placeholder: string = '';
    export let min: number | undefined = undefined;
    export let max: number | undefined = undefined;
    
    let isValid: boolean = true;
    let errorMessage: string = "";

    function handleInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const inputVal = inputElement.value;

        // Reset validation state on each input
        isValid = true;
        errorMessage = "";

        if (inputVal.trim() === '') {
            value = null; // or '', if you prefer an empty string
            isValid = !required; // If the field is required, an empty value is not valid
            errorMessage = required ? "This field is required." : "";
            return;
        }

        const numericValue = Number(inputVal);
        
        if (!isNaN(numericValue)) {
            value = numericValue; // Set value as number
            validateValue(value);
        } else {
            value = null; // Explicitly set to null to trigger reactivity
            isValid = false;
            errorMessage = "Please enter a valid number.";
        }
    }

    function validateValue(val: number | null): void {
        isValid = true;
        errorMessage = "";

        if (val === null) {
            if (!required) {
                isValid = true;
                errorMessage = "";
            } else {
                isValid = false;
                errorMessage = "This field is required.";
            }
            return;
        }
        // Check for non-empty value if required
        if ((required && val === 0)) {
            isValid = false;
            errorMessage = "This field is required.";
        } else if (min !== undefined && val && val < min) {
            // Validation for min value
            isValid = false;
            errorMessage = `Value must be greater than or equal to ${min}.`;
        } else if (max !== undefined && val && val > max) {
            // Validation for max value
            isValid = false;
            errorMessage = `Value must be less than or equal to ${max}.`;
        }
    }
</script>

<div class="row g-2" style="padding:10px 0px 0px 0px;" hidden={hidden}>
    <div class="col-md-10">
        <div class="form-floating">
            <input
                type="text"
                class="form-control {isValid ? '' : 'is-invalid'}"
                id={id}
                placeholder={placeholder}
                value={value}
                required={required}
                disabled={disabled}
                on:input={handleInput}
                on:change={handleInput}
            />
            <label for={id}>{placeholder}</label>
            {#if !isValid}
                <div class="invalid-feedback" style="display:block;">
                    {errorMessage}
                </div>
            {/if}
        </div>
    </div>
    <div class="col-md-2">
        <div class="form-floating">
            <input type="text" class="form-control" placeholder={placeholder} value={unit} disabled />
            <label for={id}>Unit</label>
        </div>
    </div>
</div>

<style>
    .is-invalid {
        border-color: #dc3545;
    }
    .invalid-feedback {
        color: #dc3545;
    }
</style>

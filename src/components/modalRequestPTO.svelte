<!-- ModalRequestPTO.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import PocketBase from 'pocketbase';

    const dispatch = createEventDispatcher();
    let isVisible = false;

    // Form fields
    let startDate = '';
    let endDate = '';
    let ptoType = '';
    let description = '';
    let isSingleDay = false;
    let isHalfDay = false;

    function toggleModal() {
        isVisible = !isVisible;
        dispatch('toggle', { isVisible });
    }


    async function handleSubmit() {
        if (!startDate || (!isSingleDay && !endDate) || !ptoType || !description) {
            alert('Please fill in all fields.');
            return;
        }

        if (!isSingleDay && new Date(startDate) >= new Date(endDate)) {
            alert('The end date must occur after the start date.');
            return;
        }

        const pb = new PocketBase('http://127.0.0.1:8090');

        let endDay;
        if(isSingleDay){
            endDay = startDate;
        } else {
            endDay = endDate;
        }
        const data = {
            "startDay": startDate,
            "endDay": endDay,
            "halfDay": isHalfDay,
            "status": "Pending",
            "type": ptoType,
            "description": description
        };

        const record = await pb.collection('timeOff').create(data);

        toggleModal(); // Close modal after submission
        startDate = '';
        endDate = '';
        ptoType = '';
        description = '';
        isSingleDay = false;
        isHalfDay = false;
    }

        // Function to open the modal
        function openModal() {
        isVisible = true;
    }
</script>

<!-- Button to open the modal -->
<button type="button" class="btn btn-primary" on:click={openModal}>Request PTO</button>

{#if isVisible}
    <div class="modal show" tabindex="-1" style="display:block;">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Request PTO</h5>
                    <button type="button" class="btn-close" aria-label="Close" on:click={toggleModal}></button>
                </div>
                <div class="modal-body">
                    <form on:submit|preventDefault={handleSubmit}>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="singleDayCheck" bind:checked={isSingleDay}>
                                <label class="form-check-label" for="singleDayCheck">
                                    Single Day
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="startDate" class="form-label">Start Date</label>
                            <input type="date" class="form-control" id="startDate" bind:value={startDate}>
                        </div>
                        {#if !isSingleDay}
                            <div class="mb-3">
                                <label for="endDate" class="form-label">End Date</label>
                                <input type="date" class="form-control" id="endDate" bind:value={endDate}>
                            </div>
                        {/if}
                        {#if isSingleDay}
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="halfDayCheck" bind:checked={isHalfDay}>
                                    <label class="form-check-label" for="halfDayCheck">
                                        Half Day
                                    </label>
                                </div>
                            </div>
                        {/if}
                        <div class="mb-3">
                            <label for="ptoType" class="form-label">PTO Type</label>
                            <select class="form-select" id="ptoType" bind:value={ptoType}>
                                <option value="" disabled selected>Select PTO Label</option>
                                <option value="Sick">Sick Day</option>
                                <option value="Vacation">Vacation Day</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control" id="description" rows="3" bind:value={description}></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" on:click={toggleModal}>Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show"></div>
{/if}

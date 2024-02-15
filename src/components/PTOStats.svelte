<script lang="ts">
    export let awardedDays: number;
    export let bonusDays: number;
    export let usedDays: number;
    export let remainingDays: number;
    export let waitingApprovalDays: number;
    export let approvedTakenDays: number;
    export let approvedNotTakenDays: number;
  </script>
  

    <div class="row">
      <!-- Total PTO Days -->
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Total PTO Days</h5>
            <p class="card-text">{awardedDays + bonusDays} (Awarded: {awardedDays}, Bonus: {bonusDays})</p>
          </div>
        </div>
      </div>
  
      <!-- Days Used -->
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Days Used</h5>
            <p class="card-text">{usedDays}</p>
          </div>
        </div>
      </div>
  
      <!-- Days Remaining -->
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Days Remaining</h5>
            <p class="card-text">{remainingDays}</p>
          </div>
        </div>
      </div>
    </div>
  
    <div class="row mt-3">
      <!-- Waiting for Approval -->
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Waiting for Approval</h5>
            <p class="card-text">{waitingApprovalDays}</p>
          </div>
        </div>
      </div>
  
      <!-- Approved PTO -->
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Approved PTO</h5>
            <p class="card-text">Taken: {approvedTakenDays}, Not Taken: {approvedNotTakenDays}</p>
          </div>
        </div>
      </div>
    </div>

  
  <style>
    .card {
      margin-bottom: 20px;
    }
  </style>
  
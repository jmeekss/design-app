<script>
    import DesignEstimator from '../components/designEstimator.svelte';
    import PtoManager from '../components/ptoManager.svelte';
    import CommissionsManager from '../components/commissionsManager.svelte';

    let currentPage = 'designEstimator'; // default page
    function navigateTo(page) {
        currentPage = page;
    }
</script>
  
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a class="navbar-brand" href="#">Worthington Products Inc</a>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a class="nav-link" href="#" on:click|preventDefault={() => navigateTo('designEstimator')}>Design Estimator</a>
          </li>
          <li class="nav-item">
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a class="nav-link" href="#" on:click|preventDefault={() => navigateTo('PtoManager')}>Time-Off Manager</a>
          </li>
          <li class="nav-item">
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a class="nav-link" href="#" on:click|preventDefault={() => navigateTo('CommissionsManager')}>Commissions Manager</a>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarAccountDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Account
              </a>
              <ul class="dropdown-menu" aria-labelledby="navbarAccountDropdown">
                <li><a class="dropdown-item" href="#">Profile</a></li>
                <li><a class="dropdown-item" href="#">Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#">Logout</a></li>
              </ul>
            </li>
          </ul>
      </div>
    </div>
  </nav>

<!-- Conditionally render components -->
{#if currentPage === 'designEstimator'}
    <DesignEstimator />
{:else if currentPage === 'PtoManager'}
    <PtoManager />
{:else if currentPage === 'CommissionsManager'}
    <CommissionsManager />
{/if}

<slot />
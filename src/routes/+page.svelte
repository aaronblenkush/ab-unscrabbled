<script>
import Unscrabbled from '$lib/Unscrabbled.svelte';
import { onMount } from 'svelte';
import { api } from '$lib/api';

let data;

onMount(async () => {
    data = {
        ...await api(fetch).getDictionary(),
        disabled: false,
    }
});

</script>
<Unscrabbled {data} />

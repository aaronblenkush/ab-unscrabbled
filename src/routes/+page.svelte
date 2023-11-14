<script>
import Unscrabbled from '$lib/Unscrabbled.svelte';
import { onMount } from 'svelte';
import { api } from '$lib/api';
import localforage from 'localforage';

const CACHE_KEY = "scrabble";

let data;

onMount(async () => {
    let keys = await localforage.keys();

    let cached = keys.includes(CACHE_KEY)
        && await localforage.getItem(CACHE_KEY);

    let payload = cached || await api().getDictionary();

    if (!cached) localforage.setItem(CACHE_KEY,payload);

    data = {
        ...payload,
        disabled: false,
    }
});

</script>
<Unscrabbled {data} />

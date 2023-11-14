<script>

import {page} from '$app/stores';
import Fa from 'svelte-fa';
import {
    faCircleQuestion, faDeleteLeft, faFlag, faHeartCircleCheck,
    faSquareCheck, faSquareXmark, faToggleOff, faToggleOn,
    faQuestionCircle
}
from '@fortawesome/free-solid-svg-icons';
import {
    faQuestionCircle as faQuestionCircleRegular
}
from '@fortawesome/free-regular-svg-icons';


//
// server data
export let data;

//
// user interface variables
let mounted = true;
let disabled = true;
let search = '';
let suggest = false;
let solve = false;
let suggest_exact = false;
let solver_minlength = 2;
let solver_maxlength = 7;
let max_results = 200;
let search_maxlength = 16;
let show_help = false;

//
// reactive vars

$: dictionary = data && new Set(data.dictionary);

$: suggestions =
    data &&
    !max_results
        || !suggest
        || !search
        || search.length < 2
        && (suggest_exact || true)
        && (solver_maxlength || true)
    ? []
    : getSuggestions()
;

$: solutions =
    data &&
    !max_results
        || !solver_maxlength
        || !solver_minlength
        || !solve
        || !search
        || search.length < 2
    ? []
    : getSolutions()
;

$: valid = data && dictionary.has(search.toUpperCase());

let keyboard = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M']
];

let points = [
    1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10
].reduce((acc,point,i) => {
    acc[String.fromCharCode(65 + i)] = point;
    return acc;
},{})

onMount(async () => {
    // render after fonts loaded
    document.fonts.ready.then(() => mounted = true);

    // load data
    let res = await fetch("./scrabble-dictionary.txt");
    let txt = await res.text();
    let dictionary = txt.split("\n")
        .map(line => {
            return line.trim().split(" ")[1];
        })
    ;
    let solver = dictionary.reduce(
        ((acc,word) => {
            let token = [...word].sort().join('');
            acc[token] = acc[token] || [];
            acc[token].push(word);
            return acc;
        }),
        {}
    );
    data = { dictionary, solver };
    disabled = false;
});

//
// app fns
function getSuggestions() {
    let result = new Set();

    let search_tokens = !suggest_exact && [...search].sort();
    for (let i=0;i<data.dictionary.length && result.size < max_results;i++) {
        let word = data.dictionary[i];
        if (word.length > solver_maxlength) continue;
        if (suggest_exact) {
            if (word.includes(search)) {
                result.add([...word].join(''));
            }
        } else {
            let word_tokens = new Set([...word]);
            let ok = true;

            for (let n=0;n<search_tokens.length;n++) {
                let token = search_tokens[n];
                if (!word_tokens.has(token)) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                result.add([...word_tokens].join(''));
            }
        }
    }

    return pageAndSort([...result]);
}

function pageAndSort(result) {
    return result.slice(0,max_results).sort((a,b) => a.length - b.length || 0).reverse();
}

function combinations(arr, n, prefix=[]) {
    if (n == 0) return [prefix];
    return arr.flatMap((v, i) =>
        combinations(arr.slice(i+1), n-1, [...prefix, v])
    );
}

function choices(word) {
    let result = new Set();
    word = word || "";
    let word_letters = [...word].sort();
    for (let i = Math.min(word.length,solver_maxlength);i>1;i--) {
        let combos = combinations(word_letters,i).map(x => x.join(''));
        for (let n=0;n<combos.length;n++) {
            result.add(combos[n]);
        }
    }
    return result;
}

function getSolutions() {
    let result = new Set();
    for (let choice of [...choices(search)]) {
        let words = data.solver[choice];
        if (words) {
            for (let n=0;n<words.length;n++) {
                if (words[n].length >= solver_minlength) {
                    result.add(words[n]);
                }
                if (result.length > 200) break;
            }
        }
        if (result.length > 200) break;
    }
    return pageAndSort([...result]);
}

function toggleSolve(x) {
    solve = typeof x === "undefined" ? !solve : x; if (solve) suggest = false;
}

function toggleSuggest(x) {
    suggest = typeof x === "undefined" ? !suggest : x; if (suggest) solve = false;
}

function toggleExact(x) {
    suggest_exact = typeof x === "undefined" ? !suggest_exact : x;
}

//
// events

function keyhandle(e) {
    if (disabled) return;
    let { which, key, ctrlKey } = e;
    let alpha = which >= 65 && which <= 90;
    let backspace = key == "Backspace";
    if (alpha && !ctrlKey) {
        search = (search + key.toUpperCase()).substring(0,search_maxlength);
    } else if (backspace) {
        search = search.substring(0,search.length - 1);
    }
}

</script>




<!-- WINDOW -->
<svelte:window
    on:keydown={keyhandle}
/>





<!--BODY -->
{#if mounted}
<div class="bg-white flex flex-col m-0 p-2 max-w-md mx-auto h-full select-none flex flex-col gap-12">
    <div class="flex flex-col gap-2">
        <div class="shrink mx-auto">
            <a
                href="{$page.url.pathname}"
                rel="external"
                class="text-3xl text-center"
            >
                {#each "UNSCRABBLED" as s}
                {#if s == " "}
                <br>
                {:else}
                <span class="inline-block p-1 bg-yellow-200 border mx-px border-gray-500 border-yellow-750">{s}</span>
                {/if}
                {/each}
            </a>
        </div>
        <div class="shrink flex gap-2">
            <div class="ml-1 my-auto">
                {#if valid || search == "ILOVEYOU"}
                <button {disabled} on:mousedown="{() => search = ""}">
                    <Fa
                        icon={search == "ILOVEYOU" ? faHeartCircleCheck : faSquareCheck}
                        class="text-green-500 text-3xl"
                    />
                </button>
                {:else}
                <button {disabled} on:mousedown="{() => search = ""}">
                    <Fa
                        icon={faSquareXmark}
                        class="text-red-500 text-3xl {search.length == 0 && "opacity-0"}"
                    />
                </button>
                {/if}
            </div>
            <div class="mx-auto">
                <input
                    class="placeholder:text-center placeholder:normal-case px-4 h-12 w-full border-2 text-2xl uppercase"
                    readonly
                    {disabled}
                    placeholder={disabled ? "LOADING..." : "enter a word"}
                    maxlength="16"
                    bind:value="{search}"
                />
            </div>
            <button
                {disabled}
                class="flex justify-center h-12 w-36 text-center p-1 text-2xl border-2"
                on:mousedown="{() => {
                    if (search.length) {
                        search = search.substring(0,search.length - 1)
                    }
                }}"
            >
                <Fa
                    icon={faDeleteLeft}
                    class="my-auto fa-solid fa-delete-left"
                />
            </button>
        </div>



        <div class="shrink flex flex-col gap-1 font-mono">
            {#each keyboard as krow,i}
            <div class="flex flex-row gap-1">
                {#if i > 0}
                <div class="flex-1"></div>
                {/if}
                {#if i > 1}
                <div class="flex-1"></div>
                {/if}
                {#each krow as letter}
                <button
                    {disabled}
                    on:mousedown="{() => search = (search + letter).substring(0,search_maxlength)}"
                    class="
                        rounded
                        flex-[2] justify-center
                        text-center p-1 text-2xl border-2
                    "
                >
                    {letter}<sub class="align-bottom text-black/50 relative inline pl-px text-xs">{points[letter] || ""}</sub>
                </button>
                {/each}
                {#if i > 0}
                <div class="flex-1"></div>
                {/if}
                {#if i > 1}
                <div class="flex-1"></div>
                {/if}
                </div>
            {/each}
        </div>


        <div class="shrink flex items-center justify-center gap-2">
            <button
                {disabled}
                on:mousedown={() => toggleSolve()}
                class="items-center rounded-xl border-2 p-2 {solve ? "text-green-700" : ""}"
            >
                Solver
                <Fa
                    icon={solve ? faToggleOn : faToggleOff}
                    class="px-2 leading-3 my-auto text-2xl"
                />

            </button>
            <div
                class="flex flex-row gap-2 items-center rounded-xl border-2 p-2"
            >
                <button
                    {disabled}
                    class="items-center {suggest ? "text-green-700" : ""}"
                    on:mousedown={() => toggleSuggest()}
                >
                    Search
                    <Fa
                        icon={suggest ? faToggleOn : faToggleOff}
                        class="px-2 leading-3 my-auto text-2xl"
                    />
                </button>

                <button
                    disabled={disabled || !suggest}
                    class="items-center {suggest && suggest_exact ? "text-green-700" : ""}"
                    on:mousedown={() => toggleExact()}
                    >
                    Exact:
                    <Fa
                        icon={(suggest && suggest_exact) ? faToggleOn : faToggleOff}
                        class="px-2 leading-3 my-auto text-2xl"
                    />
                </button>
            </div>
            <button
                {disabled}
                class="items-center rounded-xl border-2 p-2"
                on:mousedown={() => {show_help = !show_help; if (show_help) window.location = '#help'}}
            >
                Help:
                <Fa
                    icon={show_help ? faQuestionCircle : faQuestionCircleRegular}
                    class="fa-regular px-2 leading-3 my-auto text-xl"
                />
            </button>
        </div>


        {#if suggest || solve}
        <div class="grow flex flex-col mx-auto w-full px-12 text-gray-600 gap-2">
            <div class="shrink flex flex-row gap-2 text-xs uppercase">
                <div class="flex-1 flex flex-col gap-1 items-center p-1 rounded-xl border-2">
                    <b>Results: </b>
                    <div class="flex flex-row items-center gap-2">
                        <label for="solver_max_results">
                            Max: {max_results || ''}
                        </label>
                        <input
                            id="solver_max_results"
                            bind:value="{max_results}"
                            class="border-2 w-16 text-center"

                            type="range" min="100" max="1000" step="100"
                        />

                    </div>

                </div>
                <div class="flex-1 flex flex-col gap-1 items-center p-1 rounded-xl border-2">
                    <b>Word Length: </b>
                    <div>
                        <div class="flex flex-col items-center gap-2">

                            <div class="flex flex-row gap-2">
                                <label for="solver_length">
                                    Min: {solver_minlength || 2}
                                </label>
                                <input
                                    id="solver_length"
                                    bind:value="{solver_minlength}"
                                    class="border-2 w-16 text-center"

                                    type="range" min="2" max="{Math.min(search.length,solver_maxlength)}"
                                />
                            </div>
                            <div class="flex flex-row gap-2">

                                <label
                                    for="solver_length"
                                    class="text-xs uppercase"
                                    >
                                    Max: {solver_maxlength || 2}
                                </label>
                                <input
                                    id="solver_length"
                                    bind:value="{solver_maxlength}"
                                    class="border-2 w-16 text-center"

                                    type="range" min="{Math.max(2,solver_minlength)}" max="16"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {#if search.length > 1}
            <div class="grow border-2 rounded-xl flex flex-col items-center">
                <div
                    class="px-4 uppercase w-full text-center border-b-2 rounded-t-xl
                        {(
                            (solve && solutions.length > 0)
                            ||
                            (suggest && suggestions.length > 0)
                        )
                        ? "bg-green-700/50"
                        : "bg-red-700/50"}
                    "
                >
                    {#if solve}
                    {solutions.length} results
                    {:else if suggest}
                    {suggestions.length} results
                    {/if}
                </div>


                {#if (solve && solutions.length > 0) || (suggest && suggestions.length > 0)}
                <div
                    style:max-height="15rem"
                    class="grow w-full text-center overflow-y-auto"
                >
                    {#each (solve ? solutions : suggestions) as word}
                    <button
                        {disabled}
                        class="block mx-auto"
                        on:click={() => {suggest = true; solve = false; search = word;}}
                    >
                        {#each word as letter}
                        {#if suggest && search.includes(letter)}
                        <span class="font-black">{letter}</span>
                        {:else}
                        {letter}
                        {/if}
                        {/each}
                    </button>
                    {/each}
                </div>

                {/if}
            </div>
            {/if}
        </div>
        {/if}
        {#if show_help}
        <div id="help" class="shrink text-gray-500 rounded-xl border-2 p-2 px-6">
            <b>How to use UNSCRABBLED:</b>
            <br>
            Enter some letters to check if they form a playable SCRABBLE&trade; word. If valid, a green checkmark will appear, otherwise a red X will be shown. Click the checkmark or X to clear the word.
            <br>
            <br>
            Enable <b>Solver</b> to find words that use some of the letters entered
            (try: <button {disabled} on:mousedown="{() => {search = "ABCDEFGHI"; toggleSolve(true)}}" class="text-blue-500 underline">ABCDEFGHI</button>).
            <br>
            <br>
            Enable <b>Search</b> to find words that include all the letters entered
            (try: <button {disabled} on:mousedown="{() => {search = "SCRABBLE"; toggleSuggest(true); toggleExact(false)}}" class="text-blue-500 underline">SCRABBLE</button>).
            <br>
            <br>
            Enable <b>Exact</b>
            to find matches using only the exact phrase entered
            (try: <button {disabled} on:mousedown="{() => {search = "SCRA"; toggleSuggest(true); toggleExact(true)}}" class="text-blue-500 underline">SCRA</button>).
            <br>
            <br>
            Searches can be limited by word length by changing Min and Max.
        </div>
        {/if}

    </div>
    <div class="text-center text-gray-500">
        SCRABBLE&trade; is a registered trademark of HASBRO, INC.
        Copyright &copy; 2023 Aaron Blenkush. All rights reserved.
    </div>
</div>
{/if}

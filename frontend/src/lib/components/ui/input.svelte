<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { value = $bindable(), class: className, ...restProps }: HTMLInputAttributes = $props();
</script>

<input bind:value class={cn('input', className)} {...restProps} />

'use client';

import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';

export function Hero() {
	const router = useRouter();

	return (
		<Stack gap="md" align="center" ta="center">
			<Title order={1}>All-in-one Admin Panel for Your Farm Ops</Title>
			<Text c="dimmed" maw={720}>
				Monitor fields, manage inventory, track staff, and analyze yields in a modern, fast admin
				panel. Save time and make better decisions with real-time insights.
			</Text>
			<Group>
				<Button radius="xl" onClick={() => router.push('#demo')}>
					Book free demo
				</Button>
				<Button variant="default" radius="xl" onClick={() => router.push('#auth')}>
					Login / Sign up
				</Button>
			</Group>
		</Stack>
	);
}



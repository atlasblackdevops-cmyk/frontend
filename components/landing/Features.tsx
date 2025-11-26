'use client';

import { Grid, Paper, Stack, Text, Title } from '@mantine/core';
import {
	IconTractor,
	IconReportAnalytics,
	IconUsers,
	IconBox,
	IconAlertTriangle,
	IconCloud
} from '@tabler/icons-react';

const FEATURES_DATA = [
	{ icon: IconTractor, title: 'Field Management', desc: 'Plan, track and optimize field work.' },
	{ icon: IconBox, title: 'Inventory & Sales', desc: 'Manage stock, inputs and sales orders.' },
	{ icon: IconUsers, title: 'Staff & Tasks', desc: 'Assign, track and approve daily tasks.' },
	{ icon: IconReportAnalytics, title: 'Analytics', desc: 'Yield, cost and revenue dashboards.' },
	{ icon: IconAlertTriangle, title: 'Alerts', desc: 'Weather and pest alerts to act early.' },
	{ icon: IconCloud, title: 'Cloud Sync', desc: 'Secure, real-time access anywhere.' }
];

export function Features() {
	return (
		<Stack gap="lg">
			<Title order={2} ta="center">
				Admin panel highlights
			</Title>
			<Grid>
				{FEATURES_DATA.map((f) => {
					const Icon = f.icon;
					return (
					<Grid.Col key={f.title} span={{ base: 12, sm: 6, md: 4 }}>
						<Paper withBorder p="md" radius="md">
							<Stack gap={6}>
								<Icon size={28} />
								<Text fw={600}>{f.title}</Text>
								<Text c="dimmed">{f.desc}</Text>
							</Stack>
						</Paper>
					</Grid.Col>
				)})}
			</Grid>
		</Stack>
	);
}



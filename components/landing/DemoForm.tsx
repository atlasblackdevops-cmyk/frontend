'use client';

import { useState } from 'react';
import { Button, Paper, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { api } from '@/lib/api';

export function DemoForm() {
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const form = useForm({
		initialValues: {
			name: '',
			email: '',
			phone: '',
			message: ''
		},
		validate: {
			name: (v) => (v.trim().length < 2 ? 'Enter your name' : null),
			email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Invalid email'),
			phone: (v) => (v.trim().length < 7 ? 'Enter a valid phone' : null)
		},
		transformValues: (vals) => ({
			...vals,
			email: vals.email.trim().toLowerCase(),
			name: vals.name.trim(),
			phone: vals.phone.trim(),
			message: vals.message.trim()
		})
	});

	const onSubmit = async (values: typeof form.values) => {
		setLoading(true);
		try {
			await api.post('/api/v1/demo/book', values);
			setSubmitted(true);
			form.reset();
		} catch (e: any) {
			const msg = e?.response?.data?.message || e?.message || 'Failed to submit demo request';
			form.setErrors({ email: msg });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper id="demo" withBorder radius="md" p="lg">
			<Stack gap="sm">
				<Text fw={600} size="lg">
					Book your free demo
				</Text>
				{submitted ? (
					<Text c="teal">Thanks! We will contact you shortly.</Text>
				) : (
					<form onSubmit={form.onSubmit(onSubmit)}>
						<Stack>
							<TextInput label="Name" placeholder="Your name" required {...form.getInputProps('name')} />
							<TextInput
								label="Email"
								placeholder="you@example.com"
								required
								{...form.getInputProps('email')}
							/>
							<TextInput label="Phone" placeholder="+1 555 000 1234" required {...form.getInputProps('phone')} />
							<Textarea label="Message" placeholder="Tell us about your needs" minRows={3} {...form.getInputProps('message')} />
							<Button type="submit" loading={loading} radius="xl">
								Request demo
							</Button>
						</Stack>
					</form>
				)}
			</Stack>
		</Paper>
	);
}



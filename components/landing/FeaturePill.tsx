import { Group, Stack, Text, ThemeIcon } from "@mantine/core";

const FeaturePill = (props: { icon: React.FC<{ size?: number }>; title: string; subtitle?: string }) => {
    const { icon: Icon, title, subtitle } = props;
    return (
      <Group
        gap="sm"
        align="center"
        px="md"
        py={10}
        wrap="nowrap"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 9999,
          backdropFilter: 'blur(4px)'
        }}
      >
        <ThemeIcon radius="xl" size={38} color="lime" variant="light">
          <Icon size={20} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text c="white" fw={600}>
            {title}
          </Text>
          {subtitle ? (
            <Text c="gray.2" size="xs">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
      </Group>
    );
  }

  export default FeaturePill
export interface Farm {
    id: string;
    farmId?: string;
    farmName?: string;
    name?: string;
}

export interface FarmSwitcherModalProps {
    opened: boolean;
    onClose: () => void;
}


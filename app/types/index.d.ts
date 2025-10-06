export type FormControlType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'date' | 'month' | 'week' | 'time' | 'color' | 'file' | 'hidden' | 'image' | 'radio' | 'checkbox' | 'select' | 'textarea'

export interface FormControl {
    id: string;
    name: string;
    label: string;
    type: FormControlType;
    value: string;
    required?: boolean = true;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}

export interface FormSelectOption {
    label: string;
    value: string;
}

export interface FormControlSelect extends FormControl {
    type: 'select';
    options: FormSelectOption[];
}

export interface FormSection {
    title: string;
    description: string;
    controls: FormControl[];
}

export interface ServiceForm {
    title: string;
    sections: FormSection[];
}
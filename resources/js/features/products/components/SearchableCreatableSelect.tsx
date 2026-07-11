import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    id: string;
    name: string;
    tenantName?: string;
}

interface SearchableCreatableSelectProps {
    options: Option[];
    value: string;
    newValue: string;
    onValueChange: (val: string) => void;
    onNewValueChange: (val: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function SearchableCreatableSelect({
    options,
    value,
    newValue,
    onValueChange,
    onNewValueChange,
    placeholder = 'Pilih...',
    disabled = false
}: SearchableCreatableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    // The display text logic
    const selectedOption = options.find((opt) => opt.id === value);
    let displayText = placeholder;
    if (selectedOption) {
        displayText = selectedOption.name;
    } else if (newValue) {
        displayText = newValue; // Show the created value
    }

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        const lowerSearch = search.toLowerCase();
        return options.filter((opt) => opt.name.toLowerCase().includes(lowerSearch));
    }, [search, options]);

    // Check if exact match exists so we don't show "Create X" if X is already an option
    const exactMatchExists = options.some((opt) => opt.name.toLowerCase() === search.trim().toLowerCase());
    const showCreateOption = search.trim().length > 0 && !exactMatchExists;

    const handleSelectOption = (id: string) => {
        onValueChange(id);
        onNewValueChange(''); // Clear any newly created value
        setOpen(false);
        setSearch('');
    };

    const handleCreateNew = () => {
        const trimmed = search.trim();
        if (!trimmed) return;
        onValueChange(''); // Clear existing ID
        onNewValueChange(trimmed);
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-left"
                    disabled={disabled}
                >
                    <span className="truncate">{displayText}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder="Cari atau buat baru..."
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filteredOptions.length > 0) {
                                    handleSelectOption(filteredOptions[0].id);
                                } else if (showCreateOption) {
                                    handleCreateNew();
                                }
                            }
                        }}
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {/* Clear selection option */}
                    <div
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        onClick={() => handleSelectOption('')}
                    >
                        <span className="text-muted-foreground italic">Tanpa pilihan</span>
                        {(value === '' && newValue === '') && <Check className="ml-auto h-4 w-4" />}
                    </div>

                    {filteredOptions.length === 0 && !showCreateOption && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Ketik untuk mencari...
                        </div>
                    )}

                    {filteredOptions.map((opt) => (
                        <div
                            key={opt.id}
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onClick={() => handleSelectOption(opt.id)}
                        >
                            <span>{opt.name}</span>
                            {opt.tenantName && (
                                <span className="text-xs text-muted-foreground ml-1.5">({opt.tenantName})</span>
                            )}
                            {value === opt.id && <Check className="ml-auto h-4 w-4" />}
                        </div>
                    ))}

                    {showCreateOption && (
                        <div
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm font-medium text-primary outline-none hover:bg-primary/10 hover:text-primary mt-1 border-t border-dashed"
                            onClick={handleCreateNew}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Buat "{search}"
                            {newValue === search.trim() && <Check className="ml-auto h-4 w-4" />}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface MultiSelectAutocompleteProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  maxSuggestions?: number;
  minInputLength?: number;
}

export const MultiSelectAutocomplete: React.FC<MultiSelectAutocompleteProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  maxSuggestions = 10,
  minInputLength = 1
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on input and exclude already selected
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedValues.includes(option.id) &&
    inputValue.length >= minInputLength
  ).slice(0, maxSuggestions);

  // Get selected option labels for display
  const selectedOptions = options.filter(option => selectedValues.includes(option.id));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length >= minInputLength);
    setFocusedIndex(-1);
  };

  const handleSelectOption = (optionId: string) => {
    if (!selectedValues.includes(optionId)) {
      onChange([...selectedValues, optionId]);
    }
    setInputValue('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveOption = (optionId: string) => {
    onChange(selectedValues.filter(id => id !== optionId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && inputValue.length >= minInputLength) {
        setIsOpen(true);
        setFocusedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        e.preventDefault();
        break;
      case 'ArrowUp':
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        e.preventDefault();
        break;
      case 'Enter':
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelectOption(filteredOptions[focusedIndex].id);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Selected tags */}
      {selectedOptions.length > 0 && (
        <div style={styles.selectedTags}>
          {selectedOptions.map(option => (
            <div key={option.id} style={styles.tag}>
              <span style={styles.tagText}>{option.label}</span>
              <button
                onClick={() => handleRemoveOption(option.id)}
                style={styles.tagRemove}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={handleClearAll}
            style={styles.clearAllBtn}
            type="button"
          >
            Vymazat vše
          </button>
        </div>
      )}

      {/* Input field */}
      <div style={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= minInputLength) {
              setIsOpen(true);
            }
          }}
          placeholder={selectedValues.length > 0 ? "Přidat další..." : placeholder}
          style={styles.input}
        />
        
        {/* Dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div style={styles.dropdown}>
            {filteredOptions.map((option, index) => (
              <div
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                style={{
                  ...styles.option,
                  ...(index === focusedIndex ? styles.optionFocused : {})
                }}
              >
                <span style={styles.optionLabel}>{option.label}</span>
                {option.description && (
                  <span style={styles.optionDescription}>{option.description}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%'
  },
  selectedTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginBottom: '8px',
    alignItems: 'center'
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #bbdefb',
    borderRadius: '16px',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: '500'
  },
  tagText: {
    marginRight: '6px'
  },
  tagRemove: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '0',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease'
  },
  clearAllBtn: {
    background: 'none',
    border: '1px solid #ccc',
    color: '#666',
    cursor: 'pointer',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '12px',
    transition: 'all 0.2s ease'
  },
  inputContainer: {
    position: 'relative' as const
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box' as const,
    backgroundColor: '#FFFFFF'
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#F6F6F6',
    border: '1px solid #ddd',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  option: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  optionFocused: {
    backgroundColor: '#f5f5f5'
  },
  optionLabel: {
    fontSize: '14px',
    color: '#333'
  },
  optionDescription: {
    fontSize: '12px',
    color: '#666',
    marginLeft: '8px'
  }
}; 
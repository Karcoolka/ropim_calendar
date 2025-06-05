import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteOption {
  id: string;
  label: string;
  description?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder: string;
  maxSuggestions?: number;
  minInputLength?: number;
  showCount?: boolean;
  onSearch?: (value: string) => void;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  maxSuggestions = 10,
  minInputLength = 1,
  showCount = false,
  onSearch
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = React.useMemo(() => {
    if (!value || value.length < minInputLength) return [];
    
    const searchTerm = value.toLowerCase();
    return options
      .filter(option => 
        option.label.toLowerCase().includes(searchTerm) ||
        (option.description && option.description.toLowerCase().includes(searchTerm))
      )
      .slice(0, maxSuggestions);
  }, [value, options, maxSuggestions, minInputLength]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length >= minInputLength);
    setHighlightedIndex(-1);
  };

  // Handle option selection
  const handleOptionSelect = (option: AutocompleteOption) => {
    onChange(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onSelect) {
      onSelect(option);
    }
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear input
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (value.length >= minInputLength) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={styles.input}
          autoComplete="off"
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={styles.clearButton}
            aria-label="Vymazat"
          >
            ×
          </button>
        )}
        <button
          type="button"
          onClick={() => onSearch && onSearch(value)}
          style={styles.searchButton}
          aria-label="Hledat"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div ref={dropdownRef} style={styles.dropdown}>
          {filteredOptions.map((option, index) => (
            <div
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              style={{
                ...styles.option,
                ...(index === highlightedIndex ? styles.highlightedOption : {})
              }}
            >
              <div style={styles.optionLabel}>
                {option.label}
                {showCount && option.description && (
                  <span style={styles.optionCount}>({option.description})</span>
                )}
              </div>
              {!showCount && option.description && (
                <div style={styles.optionDescription}>
                  {option.description}
                </div>
              )}
            </div>
          ))}
          
          {filteredOptions.length === maxSuggestions && (
            <div style={styles.moreResults}>
              ... a další možnosti
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%'
  },
  inputContainer: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    paddingRight: '70px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF'
  },
  clearButton: {
    position: 'absolute' as const,
    right: '40px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'color 0.2s ease'
  },
  searchButton: {
    position: 'absolute' as const,
    right: '8px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#368537',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(54, 133, 55, 0.1)'
    },
    '& svg': {
      width: '16px',
      height: '16px'
    }
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: '#F6F6F6',
    border: '1px solid #ccc',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxHeight: '300px',
    overflowY: 'auto' as const,
    zIndex: 1000
  },
  option: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease'
  },
  highlightedOption: {
    backgroundColor: '#F6F6F6'
  },
  optionLabel: {
    fontWeight: '500',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  optionCount: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'normal'
  },
  optionDescription: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px'
  },
  moreResults: {
    padding: '8px 12px',
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center' as const,
    borderTop: '1px solid #f0f0f0'
  }
}; 
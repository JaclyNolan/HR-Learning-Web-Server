import { Autocomplete, Box, CircularProgress, Menu, MenuItem, TextField } from '@mui/material';
import debounce from 'lodash/debounce';
import React, { useEffect, useMemo, useRef, useState } from 'react';

function DebounceSelectForAssign({ fetchOptions, debounceTimeout = 800, presetOptions = [], ...props }) {
    const { name, label, value = nul, onChange, disableOptions = [], ...props2 } = props;
    const [open, setOpen] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [options, _setOptions] = useState(presetOptions);
    const [autoValue, setAutoValue] = useState(value);
    const [inputValue, setInputValue] = useState('');

    // console.log(autoValue);

    const setOptions = (newOptions = []) => {
        // console.log(presetOptions.concat(newOptions));
        presetOptions.forEach((presetOption) => {
            const matchingIndex = newOptions.findIndex((newOption) => {
                return presetOption.value === newOption.value
            })
            if (matchingIndex !== -1)
                newOptions.splice(matchingIndex, 1);
        })
        if (presetOptions) {
            _setOptions(presetOptions.concat(newOptions));
        } else {
            _setOptions(newOptions);
        }

    }
    const fetchRef = useRef(0);
    const debounceFetcher = useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                setOptions(newOptions);
                setFetching(false);
            });
        };
        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    useEffect(() => {
        debounceFetcher.apply(null, [inputValue])
    }, [inputValue])
    // console.log('value: ', value)
    // console.log('search value: ', searchInput)
    return (
        <Autocomplete
            filterOptions={(x) => x} //Disable built-in filter/search
            fullWidth
            open={open}
            id='debounce-select'
            name={name}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={(option) => `${option?.value}`}
            getOptionDisabled={(option) => 
                Boolean(disableOptions.find((disableOption) => disableOption.id === option.value))
            }
            value={autoValue}
            onChange={(event, newValue) => {
                setAutoValue(null);
                setInputValue(inputValue);
                // setInputValue(event.target.inputValue)
                if (onChange) onChange(newValue);
            }}
            options={options}
            loading={fetching}
            inputValue={inputValue}
            onInputChange={(event, value) => {
                setInputValue(value);
            }}
            renderOption={(props, option) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    {option.label}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...props2}
                    label={label}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {fetching ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}

export default DebounceSelectForAssign
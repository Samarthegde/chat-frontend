import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { Helmet } from 'react-helmet';
import useTranslation from 'hooks/use-translation';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import SettingsMenu from 'views/settings/components/settings-menu';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import { keysAtom } from 'atoms';
import {
    Box, TextField, Button, InputAdornment, IconButton,
    Table, TableBody, TableCell, TableHead, TableRow, CircularProgress,
    Dialog, DialogContent, TablePagination,
    InputLabel,
    Select,
    MenuItem,
    TableContainer,
    Paper
} from '@mui/material';
import CopyToClipboard from 'components/copy-clipboard';
import ContentCopy from 'svg/content-copy';
import { nip19 } from 'nostr-tools';
import crypto from 'crypto-browserify';
import axios from 'axios';
import Delete from 'svg/delete';

const publicKey = `-----BEGIN PUBLIC KEY-----
MIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBxvLN5CgAfaVfCZSgt+ydH
96EMhRP+98OIySzGK9GSaeMchIppiVecr9eG1Wp51iliBH4MK70jBz2DclbVUf4i
hYwylr0rAo1uJ8B3sMrz39S1BuUgFs854e7R3f1WcTdXDe9Ze9IcZ3qWWC7K2iay
dFoppC1wvVs7yfcKo/BBcXQJASANTy18T8Wg1tZC4Sfdr7TQtho+i0HAJTx1llPO
tp+4c1UDuTYYPEFf34H9mc41nnd0eMYr0g+SQJQHgBg8CGk0hO9CMPeVQU7P2enm
u5OQZhigC7rId9GNnm98yfhZa9hSZioiRfMpEUmr23SITucfkbytov31PRrSk5oc
UeMYCXate9DaK5TqKCzsGTp7pvqJgiEKw6llnp0iUca02/cAqFn8z9VHD4CxUuPn
zM+TrgR1aittTxYUaTRLY7d8IQbnXpJ3y76PPra/BaSkyeoywv6EF3TpRbVtLfwU
dg3+jBZlbrM6NKFPylorN5u04j214FaL/2cdmHjnC1YhppWla0uA1yps4uU+tS1q
uqRRqqNn7LGpBDpM8ipby+m9iaChkettqdfsxVfGFX9dDtA7xPTFD7bsVBu1ScME
tAdLsmQCO8RRbC9piFZW3cVjMihXcwEpw/79uA1Q3t7p3fIlJVsT5y2UVXNjpquX
tBBrIHqvIcwkgt451wYS4wIDAQAB
-----END PUBLIC KEY-----`;

function encryptWithRSA(publicKey: string, text: string): string {
    const buffer = Buffer.from(text, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
}

const VersatilePage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [token, setToken] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [currency_note, setCurrencyNote] = useState<string>('');
    const [currency_note_number, setCurrencyNoteNUmber] = useState<string>('');
    const [branch_name, setBranchName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage] = useState<number>(10);
    const [tokenToValidate, setTokenToValidate] = useState<string>('');
    const [validationResult, setValidationResult] = useState<any | null>(null);
    const [showValidationDialog, setShowValidationDialog] = useState<boolean>(false);


    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys, navigate]);

    const npriv = keys ? nip19.nsecEncode(keys.priv) : '';

    // Fetch tokens
    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await axios.get('http://localhost:3001/token/all', {
                    params: { npriv: npriv }
                });

                if (response.data.status === 'success') {
                    setTokens(response.data.tokens);
                } else {
                    throw new Error('Failed to fetch tokens.');
                }
            } catch (err) {
                setError(t('Error fetching tokens.'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (npriv) {
            fetchTokens();
        }
    }, []);

    // Generate QR code
    useEffect(() => {
        const updatedQrCodeUrl = encryptWithRSA(
            publicKey,
            `tk=${token || ''}
            &k=${npriv || ''}
            &amt=${amount || ''}
            &cn=${currency_note || ''}
            &c_note_no=${currency_note_number || ''}
            &bn=${branch_name || ''}
            &loc=${location || ''}
            &note=${notes || ''}`
        );
        setQrCodeUrl(updatedQrCodeUrl);
    }, [token, amount, npriv, currency_note, currency_note_number, branch_name, location, notes]);

    // Generate token
    const generateToken = () => {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        const token = Array.from(array)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
        setToken(token);
    };

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
    };

    const handleCurrencyNoteChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setCurrencyNote(event.target.value);
    };

    const handleCurrencyNoteNumberChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setCurrencyNoteNUmber(event.target.value);
    }

    const handleBranchName = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setBranchName(event.target.value);
    }

    const handleLocation = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setLocation(event.target.value);
    }

    const handleNotes = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setNotes(event.target.value);
    }

    const handleSave = async () => {
        if (!token || !amount) {
            alert(t('Please generate a token and set an amount before syncing.'));
            return;
        }

        setIsSaving(true); // Show loading state
        try {
            const payload = { qrCodeUrl };

            const response = await axios.post('http://localhost:3001/token/save', payload);

            alert(t('Data saved successfully!'));
            window.location.reload();
        } catch (error) {
            console.error('Save failed:', error);
            alert(t('Failed to save data. Please try again.'));
        } finally {
            setIsSaving(false); // Reset loading state
        }
    };

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    // Delete token
    const handleDelete = async (token: string) => {
        try {
            const payload = { token, key: npriv };
            await axios.delete(`http://localhost:3001/token/delete/`, { data: payload });

            alert(t('Token deleted successfully!'));
            window.location.reload();
        } catch (error) {
            console.error('Delete failed:', error);
            alert(t('Failed to delete token. Please try again.'));
        }
    };

    // Validate token
    const handleValidateToken = async () => {
        try {
            const response = await axios.get('http://localhost:3001/token/detail', {
                params: { token: tokenToValidate, key: npriv }
            });

            if (response.data.status === 'success') {
                setValidationResult(response.data.token);
                setShowValidationDialog(true);
            } else {
                throw new Error(t('Token validation failed.'));
            }

        } catch (error) {
            console.error('Token validation failed:', error);
            alert(t('Failed to validate token. Please try again.'));
        }
    };

    // Sign token
    const handleSignToken = async () => {
        try {
            const response = await axios.post('http://localhost:3001/token/sign', {
                token: tokenToValidate,
                key: npriv
            });

            if (response.data.status === 'success') {
                alert(t('Token signed successfully!'));
                window.location.reload();
            } else {
                throw new Error(t('Token signing failed.'));
            }
        } catch (error) {
            console.error('Token signing failed:', error);
            alert(t('Failed to sign token. Please try again.'));
        }
    };

    return (
        <>
            <Helmet><title>{t('BangarpetChat - Token Management')}</title></Helmet>
            <AppWrapper>
                <SettingsMenu />
                <AppContent>
                    <SettingsHeader section={t('Token Management')} />
                    <SettingsContent>
                        <Box sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <h2>{t('Generate Token')}</h2>

                            <InputLabel id="currency-note-label">{t('Currency Note')}</InputLabel>
                            <Select
                                labelId="currency-note-label"
                                id="currency-note"
                                value={currency_note}
                                onChange={handleCurrencyNoteChange}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    {t('Select Currency Note')}
                                </MenuItem>
                                <MenuItem value={1}>Currency Note: 01</MenuItem>
                                <MenuItem value={5}>Currency Note: 05</MenuItem>
                                <MenuItem value={10}>Currency Note: 10</MenuItem>
                                <MenuItem value={20}>Currency Note: 20</MenuItem>
                                <MenuItem value={50}>Currency Note: 50</MenuItem>
                                <MenuItem value={100}>Currency Note: 100</MenuItem>
                                <MenuItem value={200}>Currency Note: 200</MenuItem>
                                <MenuItem value={500}>Currency Note: 500</MenuItem>
                            </Select>
                            <TextField
                                fullWidth
                                sx={{ mt: '10px' }}
                                id="outlined-basic"
                                label={t('Currency Note Number')}
                                type="text"
                                value={currency_note_number}
                                onChange={handleCurrencyNoteNumberChange}
                                inputProps={{ maxLength: 10 }}
                            />
                            <TextField
                                fullWidth
                                sx={{ mt: '10px' }}
                                id="outlined-basic"
                                label={t('Amount')}
                                variant="outlined"
                                type="number"
                                value={amount}
                                required
                                onChange={handleAmountChange}
                                inputProps={{ maxLength: 8 }}
                            />
                            <TextField
                                fullWidth
                                sx={{ mt: '10px' }}
                                id="outlined-basic"
                                label={t('Branch Name')}
                                variant="outlined"
                                type="text"
                                value={branch_name}
                                onChange={handleBranchName}
                                inputProps={{ maxLength: 15 }}
                            />

                            <TextField
                                fullWidth
                                sx={{ mt: '10px' }}
                                id="outlined-basic"
                                label={t('Location')}
                                variant="outlined"
                                type="text"
                                value={location}
                                onChange={handleLocation}
                                inputProps={{ maxLength: 12 }}
                            />
                            <TextField
                                fullWidth
                                sx={{ mt: '10px' }}
                                id="outlined-basic"
                                label={t('Extra Details')}
                                variant="outlined"
                                type="text"
                                value={notes}
                                onChange={handleNotes}
                                inputProps={{ maxLength: 60 }}
                            />

                            <TextField
                                fullWidth
                                sx={{ mt: '10px' }}
                                id="outlined-basic"
                                label={t('Token')}
                                variant="outlined"
                                value={token || ''}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: <InputAdornment position="end">
                                        <CopyToClipboard copy={token || ''}>
                                            <IconButton>
                                                <ContentCopy height={22} />
                                            </IconButton>
                                        </CopyToClipboard>
                                    </InputAdornment>
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{ mt: '10px' }}
                                onClick={generateToken}
                            >
                                {t('Generate Token')}
                            </Button>
                            <Button
                                color="secondary"
                                variant="contained"
                                sx={{ mt: '10px', mx: '10px' }}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? t('Saving...') : t('Save')}
                            </Button>
                            <hr />
                            {loading ? (
                                <CircularProgress sx={{ mt: 2 }} />
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <>
                                    <h2>{t('Tokens')}</h2>
                                    <TableContainer component={Paper}>
                                        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{t('Token')}</TableCell>
                                                    <TableCell>{t('Amount')}</TableCell>
                                                    <TableCell>{t('Updated At')}</TableCell>
                                                    <TableCell>{t('Created At')}</TableCell>
                                                    <TableCell>{t('Status')}</TableCell>
                                                    <TableCell>{t('Actions')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {tokens.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((token) => (
                                                    <TableRow key={token.id}>
                                                        <TableCell>{token.token}
                                                            <CopyToClipboard copy={token.token}>
                                                                <IconButton>
                                                                    <ContentCopy height={15} />
                                                                </IconButton>
                                                            </CopyToClipboard>
                                                        </TableCell>
                                                        <TableCell>{token.amount}</TableCell>
                                                        <TableCell>{token.created_at ? new Date(token.created_at._seconds * 1000).toLocaleString() : ''}</TableCell>
                                                        <TableCell>{
                                                            token.updated_at ? new Date(token.updated_at._seconds * 1000).toLocaleString() : ''}</TableCell>
                                                        <TableCell>{token.status}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                color="secondary"
                                                                onClick={() => handleDelete(token.token)}
                                                            >
                                                                <IconButton>
                                                                    <Delete height={22} />
                                                                </IconButton>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        rowsPerPageOptions={[]}
                                        component="div"
                                        count={tokens.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                    />
                                </>
                            )}
                            <hr />
                            <h2>Validate Token</h2>
                            <TextField
                                fullWidth
                                label={t('Token')}
                                variant="outlined"
                                value={tokenToValidate}
                                onChange={(e) => setTokenToValidate(e.target.value)}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                        <IconButton
                                            aria-label="clear"
                                            onClick={() => setTokenToValidate('')}
                                        >
                                            <Delete height={22} />
                                        </IconButton>
                                    </InputAdornment>
                                }}

                            />

                            <Button
                                variant="contained"
                                sx={{ mt: '10px' }}
                                onClick={handleValidateToken}
                            >
                                {t('Validate Token')}
                            </Button>


                            {/* Validation Result Dialog */}
                            <Dialog open={showValidationDialog} onClose={() => setShowValidationDialog(false)}>
                                <DialogContent>
                                    {validationResult ? (
                                        <Box>
                                            <p>{t('Token')}: {validationResult.token}</p>
                                            <p>{t('Amount')}: {validationResult.amount}</p>
                                            <p>{t('Created At')}: {
                                                validationResult.created_at
                                                    ? new Date(validationResult.created_at._seconds * 1000).toLocaleString()
                                                    : t('Invalid Date')}</p>
                                            <p>{t('Updated At')}: {
                                                validationResult.updated_at
                                                    ? new Date(validationResult.updated_at._seconds * 1000).toLocaleString()
                                                    : t('')
                                            }</p>
                                            <p>{t('Currency Note')}: {validationResult.currency_note}</p>
                                            <p>{t('Currency Note Number')}: {validationResult.currency_note_number}</p>
                                            <p>{t('Branch Name')}: {validationResult.branch_name}</p>
                                            <p>{t('Location')}: {validationResult.location}</p>
                                            <p>{t('Notes')}: {validationResult.notes}</p>
                                            {validationResult.status === "" && (
                                                <><Button
                                                    variant="contained"
                                                    color="success"
                                                    sx={{ mt: '10px', mx: '5px' }}
                                                    onClick={() => handleSignToken()}
                                                >
                                                    {t('Sign')}
                                                </Button></>
                                            )}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                sx={{ mt: '10px' }}
                                                onClick={() => setShowValidationDialog(false)}
                                            >
                                                {t('Close')}
                                            </Button>

                                        </Box>
                                    ) : (
                                        <p>{t('No validation data available.')}</p>
                                    )}
                                </DialogContent>
                            </Dialog>
                            <hr />
                        </Box>
                    </SettingsContent>
                </AppContent>
            </AppWrapper>
        </>
    );
};

export default VersatilePage;

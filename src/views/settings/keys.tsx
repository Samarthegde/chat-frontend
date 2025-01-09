import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { RouteComponentProps, useNavigate } from '@reach/router';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet';
import { nip19 } from 'nostr-tools';
import useTranslation from 'hooks/use-translation';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import SettingsMenu from 'views/settings/components/settings-menu';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import { keysAtom } from 'atoms';
import Eye from 'svg/eye';
import EyeOff from 'svg/eye-off';
import Information from 'svg/information';
import crypto from 'crypto-browserify';
import axios from 'axios';
import Button from '@mui/material/Button';


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

const SettingsKeysPage = (_: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const theme = useTheme();
    const [t] = useTranslation();
    const [reveal, setReveal] = useState(false);
    const [isSaving, setIsSaving] = useState<boolean>(false); // State for sync button


    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    if (!keys) {
        return null;
    }

    const pub_key = nip19.npubEncode(keys.pub);
    const pub = encryptWithRSA(publicKey, pub_key);
    const priv_key = nip19.nsecEncode(keys.priv);
    const priv = encryptWithRSA(publicKey, priv_key);
    const handleSave = async () => {
        if (!pub || !priv) {
            alert(t('Please generate a token and set an amount before syncing.'));
            return;
        }

        setIsSaving(true); // Show loading state
        try {
            const payload = {
                'npub': pub_key,
                'nsec': priv_key
            };

            const response = await axios.post('http://localhost:3001/sync-keys', payload);
            alert(t('Keys Syncronized to DB'));
        } catch (error) {
            console.error('Save failed:', error);
            alert(t('Failed to save data or Key is already synced. Please try again.'));
        } finally {
            setIsSaving(false); // Reset loading state
        }
    };
    return <>
        <Helmet><title>{t('BangarpetChat - Keys')}</title></Helmet>
        <AppWrapper>
            <SettingsMenu />
            <AppContent>
                <SettingsHeader section={t('Keys')} />
                <SettingsContent>
                    {(() => {

                        if (keys?.priv === 'nip07' || keys?.priv === 'none') {
                            return <Box sx={{
                                mb: '50px',
                                color: theme.palette.text.secondary,
                                fontSize: '0.8em',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Information height={18} />
                                <Box
                                    sx={{ ml: '6px' }}>{keys?.priv === 'nip07' ? t('See your private key on the extension app.') : t('No private key provided.')}</Box>
                            </Box>;
                        }
                        return <>
                            <Box sx={{ mb: '30px', color: theme.palette.text.secondary, fontSize: '0.8em' }}>
                                {t('Please make sure you save a copy of your private key.')}
                            </Box>
                            <TextField sx={{ mb: '30px' }} label={t('Private key')} value={reveal ? priv : 'x'.repeat(64)}
                                fullWidth
                                type={reveal ? 'text' : 'password'}
                                helperText={<Box component="span" sx={{
                                    fontWeight: 'bold',
                                    color: theme.palette.warning.main,
                                    opacity: .7
                                }}>
                                </Box>}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: <InputAdornment position="end">
                                        <Tooltip title={reveal ? t('Hide') : t('Reveal')}>
                                            <IconButton onClick={() => {
                                                setReveal(!reveal);
                                            }}>
                                                {reveal ? <EyeOff height={22} /> : <Eye height={22} />}
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                }}
                            />
                        </>
                    })()}
                    <TextField label={t('Public key')} value={pub} fullWidth
                        InputProps={{
                            readOnly: true,
                            endAdornment: <InputAdornment position="end">
                            </InputAdornment>
                        }}
                    />

                    <Button
                        color="secondary"
                        variant="contained"
                        sx={{ mt: '10px', mx: '10px' }}
                        onClick={handleSave}
                        disabled={isSaving} // Disable during syncing
                    >
                        {isSaving ? t('Saving...') : t('Save')}
                    </Button>
                    <Box sx={{color: theme.palette.error.main, fontWeight: 'bold', fontSize: '0.9em', mt: '10px' }}>
                        {t('Click on Save to sync your keys to the decentralized database.')}
                    </Box>
                </SettingsContent>
            </AppContent>
        </AppWrapper>
    </>;
}

export default SettingsKeysPage;

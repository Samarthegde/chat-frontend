import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { nip19 } from 'nostr-tools';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet';
import useTranslation from 'hooks/use-translation';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import SettingsMenu from 'views/settings/components/settings-menu';
import { keysAtom } from 'atoms';
import CopyToClipboard from 'components/copy-clipboard';
import ContentCopy from 'svg/content-copy';
import Information from 'svg/information';
import Button from '@mui/material/Button';
import axios from 'axios';
import NonReactQRCode from './components/qrcode';

const SettingsPublicLinkPage = (_: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const theme = useTheme();
    const [name, setName] = useState(''); // State to hold the name value

    useEffect(() => {
        if (!keys) navigate('/login').then();
    }, [keys]);

    const npub = useMemo(() => keys?.pub ? nip19.npubEncode(keys.pub) : null, [keys]);
    const nsec = useMemo(() => keys?.priv ? nip19.nsecEncode(keys.priv) : null, [keys]);

    const url = useMemo(() => {
        return npub ? `${window.location.protocol}//${window.location.host}/dm/${npub}` : '';
    }, [npub]);

    if (!keys || !npub) {
        return <div>{t('Unable to generate QR code. Please check your keys.')}</div>;
    }


    return <>
        <Helmet><title>{t('BangarpetChat - Public DM page')}</title></Helmet>
        <AppWrapper>
            <SettingsMenu />
            <AppContent>
                <SettingsHeader section={t('Public DM page')} />
                <SettingsContent>
                    <Box sx={{
                        maxHeight: '80vh',
                        overflowY: 'auto'

                    }}>
                        <Box sx={{
                            mb: '20px',
                            color: theme.palette.text.secondary,
                            fontSize: '0.8em',
                            display: 'flex',
                            alignItems: 'center',
                            maxHeight: '80vh',
                            overflowY: 'auto'

                        }}>
                            <Information height={18} />
                            <Box sx={{ ml: '6px' }}>{t('Your public DM page allows people to get in contact with you easily.')}</Box>
                        </Box>

                        <TextField value={url} fullWidth
                            InputProps={{
                                readOnly: true,
                                endAdornment: <InputAdornment position="end">
                                    <CopyToClipboard copy={url}>
                                        <IconButton>
                                            <ContentCopy height={22} />
                                        </IconButton>
                                    </CopyToClipboard>
                                </InputAdornment>
                            }}
                        />
                        <NonReactQRCode url={url} size={300}/>
                    </Box>
                </SettingsContent>
            </AppContent>
        </AppWrapper>
    </>;
};

export default SettingsPublicLinkPage;

import React, {useState} from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {TextField} from '@mui/material';
import {nip19} from 'nostr-tools';
import {DecodeResult} from 'nostr-tools/lib/nip19';

import CloseModal from 'components/close-modal';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';

const ImportAccount = (props: { onSuccess: (key: string, type: 'pub' | 'priv') => void }) => {
    const {onSuccess} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();
    const [userKey, setUserKey] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);

    const handleClose = () => {
        showModal(null);
    };

    const handleSubmit = () => {
        if (userKey.startsWith('nsec') || userKey.startsWith('nsec')) {
            let dec: DecodeResult;
            try {
                dec = nip19.decode(userKey);
            } catch (e) {
                setIsInvalid(true);
                return;
            }

            const key = dec.data as string;
            if (dec.type === 'nsec') {
                onSuccess(key, 'priv');
            } else if (dec.type === 'npub') {
                onSuccess(key, 'pub');
            } else {
                setIsInvalid(true);
            }
        } else {
            setIsInvalid(true);
        }
    }

    const handleUserKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setUserKey(e.target.value);
        setIsInvalid(false);
    }

    return (
        <>
            <DialogTitle>{t('Sign in')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent sx={{pb: '0'}}>
                <TextField fullWidth autoComplete="off" autoFocus
                           value={userKey} onChange={handleUserKeyChange}
                           placeholder={t('Enter private key')}
                           error={isInvalid}
                           helperText={isInvalid ? t('Invalid key') : ' '}
                           inputProps={{
                               autoCorrect: 'off',
                           }}
                           onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                   handleSubmit()
                               }
                           }}/>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleSubmit} disableElevation>{t('Submit')}</Button>
            </DialogActions>
        </>
    );
}

export default ImportAccount;

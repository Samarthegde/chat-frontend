import {Capacitor} from '@capacitor/core';
import {PaletteMode} from '@mui/material';
import {Channel, Platform, RelayDict} from 'types';

export const DEFAULT_RELAYS: RelayDict = {
    'wss://relay1.nostrchat.io': {read: true, write: true},
    'wss://relay2.nostrchat.io': {read: true, write: true},
    'wss://relay.damus.io': {read: true, write: true},
    'wss://relay.snort.social': {read: true, write: false},
    'wss://nos.lol': {read: true, write: true},
};

export const MESSAGE_PER_PAGE = 30;
export const ACCEPTABLE_LESS_PAGE_MESSAGES = 5;
export const SCROLL_DETECT_THRESHOLD = 5;

export const GLOBAL_CHAT: Channel = {
    id: 'ca3e4b43f8946c9568ff709a3113bc5eb4727cf7167f247805cd412184f97f50',
    name: 'Global Chat',
    about: 'open protocol that enables global, decentralized, and censorship-resistant communication.',
    picture: '',
    creator: 'aea59833635dd0868bc7cf923926e51df936405d8e6a753b78038981c75c4a74',
    created: 1678198928
};

export const PLATFORM = Capacitor.getPlatform() as Platform;

export const DEFAULT_THEME: PaletteMode = 'dark';
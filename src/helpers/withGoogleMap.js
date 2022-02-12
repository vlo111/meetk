import { GoogleApiWrapper } from 'google-maps-react';

const { REACT_APP_GOOGLE_MAP_API_KEY } = process.env;

export default function withGoogleMap(Comp) {
  return GoogleApiWrapper({
    apiKey: REACT_APP_GOOGLE_MAP_API_KEY,
  })(Comp);
}

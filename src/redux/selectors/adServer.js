import { createSelector } from "reselect";

const rootSelector = state => state.adServer;

const switcherType = createSelector(
  rootSelector,
  adServer => adServer.type
);

const sourceHandler = createSelector(
  rootSelector,
  adServer => adServer.sourceHandler
);

const networkCode = createSelector(
  rootSelector,
  adServer => adServer.networkCode
);

const dfpAuthModalOpen = createSelector(
  rootSelector,
  adServer => adServer.dfpAuthModalOpen
);

const orders = createSelector(
  rootSelector,
  adServer => adServer.orders
);

const adunits = createSelector(
  rootSelector,
  adServer => adServer.adunits
);

const adServerSelectors = {
  switcherType,
  sourceHandler,
  networkCode,
  dfpAuthModalOpen,
  orders,
  adunits
};

export default adServerSelectors;

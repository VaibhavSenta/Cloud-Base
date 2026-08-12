/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import SessionDetailMobile from './Mobile/SessionDetailMobile/SessionDetailMobile';

/**
 * Logged Device / Session Details Wrapper
 */
const SessionDetail = ({ sessionId }) => {
  return <SessionDetailMobile sessionId={sessionId} />;
};

export default SessionDetail;

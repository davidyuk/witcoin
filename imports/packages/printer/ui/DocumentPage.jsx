import React from 'react';

const DocumentPage = () =>
    <span>Страница документа</span>;

DocumentPage.propTypes = {
  user: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
};

export default DocumentPage;

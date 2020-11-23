import React, {Fragment, useEffect, useState} from 'react';

import '../css/spinner.less';

export default props =>
    <div className="spinner">
        <div className="lds-ring">
            <div/>
            <div/>
            <div/>
            <div/>
        </div>
    </div>;
import React from 'react';
import { css, jsx } from '@emotion/react';
import { fontWeight } from '../constants/style';
/** @jsxRuntime classic */
/** @jsx jsx */;

export default function Station(props) {
    const station = props.data;
    const distInfo = station.dist ? ' (' +station.dist +'mi.)' : '';
    return(
        <div>
            <section
                className={(station.isVisible ? 'stationOn' : 'stationOff') + ' ' + (station.electric > 0 ? 'elecOn' : 'elecOff') + ' ' + (station.docks > 0 ? 'dockOn' : 'dockOff') + ' ' + (station.electric > 0 && station.classic === 0 ? 'elecFreeOn' : 'elecFreeOff')}
            >
                <div
                    css={css`
                        border-top: 1px solid rgba(0,0,0,0.25);
                        margin: 1em 0;
                        padding: 1em 0;
                    `}
                >
                    <h3
                        css={css`
                            font-weight: ${fontWeight['bold']};
                        `}
                    >
                        {station.name}{distInfo}
                    </h3>
                    <div 
                        css={css`
                            margin: 0;
                            width: 29vw;
                            display: inline-block;
                            padding: 0;
                            text-align: center;
                        `}
                        className="classic-bikes"
                    >
                        <h4
                            className="bikes-remaining"
                        >
                            {station.classic}
                        </h4>
                        <h5 
                            css={css`
                                font-weight: ${fontWeight['light']};
                            `}
                        >
                            Classic
                        </h5>
                    </div>
                    <div  
                        css={css`
                            margin: 0;
                            width: 29vw;
                            display: inline-block;
                            padding: 0;
                            text-align: center;
                        `}
                        className="ebikes"
                    >
                        <h4 
                            className="ebikes-remaining"
                        >
                            {station.electric}
                        </h4>
                        <h5 
                            css={css`
                                font-weight: ${fontWeight['light']};
                            `}
                        >
                            Electric
                        </h5>
                    </div>
                    <div  
                        css={css`
                            margin: 0;
                            width: 29vw;
                            display: inline-block;
                            padding: 0;
                            text-align: center;
                        `}
                        className="docks"
                    >
                        <h4 
                            className="docks-remaining"
                        >
                            {station.docks}
                        </h4>
                        <h5 
                            css={css`
                                font-weight: ${fontWeight['light']};
                            `}
                        >
                            Docks
                        </h5>
                    </div>
                </div>
            </section>
        </div>
    )
}
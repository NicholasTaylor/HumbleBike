import { css, jsx } from '@emotion/react';
import { fontWeight, fontSize, space } from '../constants/style';
/** @jsxRuntime classic */
/** @jsx jsx */;

export default function Options () {
    return(
        <div
            css={css`
                width: 100vw;
                height: 100vh;
                background-color: black;
                color: white;
                text-align: center;
                position: absolute;
                z-index: 200;
            `}
        >
            <div
                css={css`
                    margin: ${space[4]} 0 0 0;
                    input[type = "checkbox"] 
                            {
                                -ms-transform: scale(2); /* IE */
                                -moz-transform: scale(2);
                                -webkit-transform: scale(2);
                                -o-transform: scale(2);
                                transform: scale(2);
                                padding: 10px;
                            }
                    > div {
                        font-size: ${fontSize[3]};
                        line-height: ${fontSize[3]};
                        font-weight: ${fontWeight['bold']};
                        text-align: left;
                        margin: ${space[5 ]} ${space[5]} ${space[6]} ${space[5]};
                    }

                    > div > span {
                        margin: 0 1em 0 0;
                    }
                `}
            >
                <h1
                    css={css`
                        font-size: ${fontSize[5]};
                        line-height: ${fontSize[5]};
                        font-weight: ${fontWeight['bold']};
                    `}
                >
                    Options
                </h1>
                <div>
                    <span>
                        Electric Only?
                    </span>
                    <input
                        type="checkbox"
                        label="Electric Only?"
                    />
                </div>
                <div>
                    <span>
                        Docks Only?
                    </span>
                    <input
                        type="checkbox"
                        label="Docks Only?"
                    />
                </div>
                <div>
                    <span>
                        Electric with No Classic?
                    </span>
                    <input
                        type="checkbox"
                        label="Electric with No Classic?"
                    />
                    
                    {/* Convert this to a help icon item - <i>(CitiBike waives e-bike charges if there are only e-bikes at a station at the start of the ride)</i> */}
                </div>
            </div>
        </div>
    )
}
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
                    margin: ${space[4]} ${space[0]} ${space[0]} ${space[0]};
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
                <div
                    css={css`
                        input[type = "checkbox"] 
                            {
                                -ms-transform: scale(2); /* IE */
                                -moz-transform: scale(2);
                                -webkit-transform: scale(2);
                                -o-transform: scale(2);
                                transform: scale(2);
                                padding: 10px;
                            }
                    `}
                >
                    <span
                        css={css`
                            font-weight: ${fontWeight['bold']};
                            margin: 0.5em;
                            display: inline-block;
                        `}
                    >
                        <span
                            css={css`
                                margin: 0 1em 0 0;
                            `}
                        >
                            Electric Only?
                        </span>
                        <input
                            type="checkbox"
                            label="Electric Only?"
                        />
                    </span>
                    <span
                        css={css`
                            font-weight: ${fontWeight['bold']};
                            margin: 0.5em;
                            display: inline-block;
                        `}
                    >
                        <span
                            css={css`
                                margin: 0 1em 0 0;
                            `}
                        >
                            Docks Only?
                        </span>
                        <input
                            type="checkbox"
                            label="Docks Only?"
                        />
                    </span>
                    </div>
                    <div
                        css={css`
                            margin: 1em 0;
                            padding: 1em 0;
                            border: white 1px dotted;
                        `}
                    >
                    <div
                        css={css`
                            input[type = "checkbox"] 
                                {
                                    -ms-transform: scale(2); /* IE */
                                    -moz-transform: scale(2);
                                    -webkit-transform: scale(2);
                                    -o-transform: scale(2);
                                    transform: scale(2);
                                    padding: 10px;
                                }
                        `}
                    >
                        <span
                            css={css`
                                font-weight: ${fontWeight['bold']};
                                margin: 0.5em;
                                display: inline-block;
                            `}
                        >
                        <span
                            css={css`
                                margin: 0 1em 0 0;
                            `}
                        >
                            Electric with No Classic?
                        </span>
                        <input
                            type="checkbox"
                            label="Electric with No Classic?"
                        />
                        </span>
                    </div>
                    <div
                        css={css`
                            input[type = "checkbox"] 
                                {
                                    -ms-transform: scale(2); /* IE */
                                    -moz-transform: scale(2);
                                    -webkit-transform: scale(2);
                                    -o-transform: scale(2);
                                    transform: scale(2);
                                    padding: 10px;
                                }
                        `}
                    >
                        <span
                            css={css`
                                font-weight: ${fontWeight['bold']};
                                margin: 0.5em;
                                display: inline-block;
                            `}
                        >
                            <i>(CitiBike waives e-bike charges if there are only e-bikes at a station at the start of the ride)</i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
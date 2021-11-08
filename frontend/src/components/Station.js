import { css, jsx } from '@emotion/react';
import { fontWeight, fontSize } from '../constants/style';
/** @jsxRuntime classic */
/** @jsx jsx */;

export default function Station(props) {
    const station = props.data;
    const distInfo = station.dist ? ' (' +station.dist +'mi.)' : '';
    const unWidow = (str) => {
        const arr = str.split(' ');
        let output = '';
        let spaceChar;
        for (let i=0; i < arr.length; i++) {
            if (i === arr.length - 1){
                spaceChar = '';
            } else if (i === arr.length - 2){
                spaceChar = '\u00A0';
            } else {
                spaceChar = ' ';
            }
            output += arr[i] + spaceChar;
        }
        return output;
    }
    return(
        <section
            className={(station.isVisible ? 'stationOn' : 'stationOff') + ' ' + (station.electric > 0 ? 'elecOn' : 'elecOff') + ' ' + (station.docks > 0 ? 'dockOn' : 'dockOff') + ' ' + (station.electric > 0 && station.classic === 0 ? 'elecFreeOn' : 'elecFreeOff')}
        >
            <div
                css={css`
                    border-top: 1px solid rgba(0,0,0,0.25);
                    margin: 1em 0;
                    padding: 1em 0;
                    div {
                        margin: 0;
                        width: 29vw;
                        display: inline-block;
                        padding: 0;
                        text-align: center;
                        h4 {
                            font-size: ${fontSize[6]};
                            font-weight: ${fontWeight['bold']};
                        }
                        h5 {
                            font-size: ${fontSize[2]};
                            font-weight: ${fontWeight['regular']};
                        }
                    }

                `}
            >
                <h3
                    css={css`
                        font-weight: ${fontWeight['bold']};
                        font-size: ${fontSize[3]};
                    `}
                >
                    {unWidow(station.name)}
                </h3>
                <h4
                    css={css`
                        font-weight: ${fontWeight['bold']};
                        font-size: ${fontSize[2]};
                    `}
                >
                    {distInfo}
                </h4>
                <div>
                    <h4>
                        {station.classic}
                    </h4>
                    <h5>
                        Classic
                    </h5>
                </div>
                <div>
                    <h4>
                        {station.electric}
                    </h4>
                    <h5>
                        Electric
                    </h5>
                </div>
                <div>
                    <h4>
                        {station.docks}
                    </h4>
                    <h5>
                        Docks
                    </h5>
                </div>
            </div>
        </section>
    )
}
import { css, jsx } from '@emotion/react';
import { fontWeight, fontSize, space } from '../constants/style';
/** @jsxRuntime classic */
/** @jsx jsx */;

function Logo() {
	return(
		<header>
			<div
				css={css`
					text-align: center
				`}
			>
				<h1
					css={css`
						font-size: ${fontSize[6]};
						line-height: ${fontSize[8]};
						font-weight: ${fontWeight['bold']};
					`}
				>
					HumbleBike
					<sup
						css={css`
							border: 1px solid rgba(0,0,0,0.25);
							font-size: ${fontSize[0]};
							vertical-align: top;
							padding: ${space[1]};
							font-weight: ${fontWeight['bold']};
							line-height: ${fontSize[6]};
						`}
					>
						BETA
					</sup>
				</h1>
			</div>
		</header>
	)
}

export default Logo;
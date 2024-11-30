import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const TextWidget = ({ config }) => {
    const {
        title,
        content,
        style = {},
        textAlignment = 'left',
        fontSize = 'medium',
        backgroundColor = 'transparent',
        textColor = 'inherit',
        padding = 2,
        elevation = 0,
        showBorder = false,
        borderColor = '#e0e0e0',
        titleVariant = 'h6'
    } = config;

    return (
        <Paper 
            elevation={elevation}
            sx={{ 
                height: '100%',
                backgroundColor,
                border: showBorder ? `1px solid ${borderColor}` : 'none',
                overflow: 'auto'
            }}
        >
            <Box sx={{ p: padding }}>
                {title && (
                    <Typography 
                        variant={titleVariant} 
                        gutterBottom
                        align={textAlignment}
                        sx={{ 
                            color: textColor,
                            fontWeight: style.titleFontWeight || 'medium'
                        }}
                    >
                        {title}
                    </Typography>
                )}
                <Box sx={{ 
                    textAlign: textAlignment,
                    '& p': { 
                        margin: 0,
                        color: textColor,
                        fontSize: fontSize,
                        lineHeight: style.lineHeight || 1.5
                    },
                    '& a': {
                        color: style.linkColor || 'primary.main'
                    },
                    '& blockquote': {
                        borderLeft: '4px solid',
                        borderColor: style.quoteColor || 'grey.300',
                        margin: 1,
                        padding: 1,
                        pl: 2,
                        fontStyle: 'italic'
                    }
                }}>
                    <ReactMarkdown>
                        {content || 'No content'}
                    </ReactMarkdown>
                </Box>
            </Box>
        </Paper>
    );
};

export default TextWidget; 
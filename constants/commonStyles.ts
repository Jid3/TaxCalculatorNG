import { StyleSheet } from 'react-native';
import { ColorScheme } from '@/hooks/userTheme';

/**
 * Common style factory for tab screens
 * Reduces code duplication by providing shared style patterns
 */
export const createCommonStyles = (colors: ColorScheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        backgroundColor: colors.surface,
        padding: 10,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold' as 'bold',
        color: colors.text,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: colors.textMuted,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold' as 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    input: {
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.text,
    },
    label: {
        fontSize: 14,
        fontWeight: '600' as '600',
        color: colors.text,
        marginBottom: 8,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center' as 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold' as 'bold',
    },
    content: {
        padding: 20,
    },
});

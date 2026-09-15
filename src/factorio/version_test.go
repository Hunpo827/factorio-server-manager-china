package factorio

import "testing"

// The compatibility of mods (and mod-releases) is checked with `GEC`.
// Those tests document the behaviour for the "new" factorio versions.
func TestModCompatibilityAcrossVersions(t *testing.T) {
	tests := []struct {
		name       string
		installed  Version
		required   Version
		compatible bool
	}{
		{
			name:       "1.1 mod on a 1.1 server",
			installed:  Version{1, 1, 107, 0},
			required:   Version{1, 1, 0, 0},
			compatible: true,
		},
		{
			name:       "2.0 mod on a 2.0 server",
			installed:  Version{2, 0, 32, 0},
			required:   Version{2, 0, 0, 0},
			compatible: true,
		},
		{
			name:       "space-age mod on a 2.0 server",
			installed:  Version{2, 0, 32, 0},
			required:   Version{2, 0, 28, 0},
			compatible: true,
		},
		{
			name:       "1.1 mod on a 2.0 server",
			installed:  Version{2, 0, 32, 0},
			required:   Version{1, 1, 0, 0},
			compatible: false,
		},
		{
			name:       "2.0 mod on a 1.1 server",
			installed:  Version{1, 1, 107, 0},
			required:   Version{2, 0, 0, 0},
			compatible: false,
		},
		{
			name:       "1.0 mod on a 1.1 server",
			installed:  Version{1, 1, 107, 0},
			required:   Version{1, 0, 0, 0},
			compatible: false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := test.installed.GEC(test.required); got != test.compatible {
				t.Errorf("GEC(%s, %s) = %v, expected %v",
					test.installed, test.required, got, test.compatible)
			}
		})
	}
}

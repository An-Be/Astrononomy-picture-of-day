import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { act } from "react-dom/test-utils";

describe("App", () => {
  act(() => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });
  });

  test("renders astronomy data when API call succeeds", async () => {
    const fakeAstronomyData = {
      copyright: "Matias Tomasello",
      date: "2023-03-30",
      explanation:
        "The delightful Dark Doodad Nebula drifts through southern skies, a tantalizing target for binoculars toward the small constellation Musca, The Fly. The dusty cosmic cloud is seen against rich starfields just south of the Coalsack Nebula and the Southern Cross. Stretching for about 3 degrees across the center of this telephoto field of view, the Dark Doodad is punctuated near its southern tip (upper right) by yellowish globular star cluster NGC 4372. Of course NGC 4372 roams the halo of our Milky Way Galaxy, a background object some 20,000 light-years away and only by chance along our line-of-sight to the Dark Doodad. The Dark Doodad's well defined silhouette belongs to the Musca molecular cloud, but its better known alliterative moniker was first coined by astro-imager and writer Dennis di Cicco in 1986 while observing Comet Halley from the Australian outback. The Dark Doodad is around 700 light-years distant and over 30 light-years long.",
      hdurl: "https://apod.nasa.gov/apod/image/2303/Doodad200mmAPOD.jpg",
      media_type: "image",
      service_version: "v1",
      title: "NGC 4372 and the Dark Doodad",
      url: "https://apod.nasa.gov/apod/image/2303/Doodad200mmAPOD1024crop.jpg",
    };
    act(() => {
      fetchMock.mockResolvedValue({
        status: 200,
        json: jest.fn(() => fakeAstronomyData),
      });
      render(<App />);
    });
    waitFor(() => {
      expect(screen.findByText(fakeAstronomyData.title)).toBeInTheDocument();

      expect(
        screen.findByDisplayValue(fakeAstronomyData.copyright)
      ).toBeInTheDocument();
      expect(screen.findByDisplayValue("pic of day")).toBeInTheDocument();
      expect(
        screen.queryByText("Sorry something went wrong, please try again.")
      ).not.toBeInTheDocument();
      const nasaLogo = screen.getByAltText(/nasa logo/i);
      expect(nasaLogo).toBeInTheDocument();
    });

  });

  test("renders error when API call fails", async () => {
    act(() => {
      fetchMock.mockReject(() => Promise.reject("API error"));

      render(<App />);

    });
    waitFor(() => {
      expect(
        screen.findByText("Sorry something went wrong, please try again.")
      ).toBeInTheDocument();
    });
  });
});
